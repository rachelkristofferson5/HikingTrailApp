"""
Management command to sync parks and trails from NPS and Recreation.gov APIs
Usage: python manage.py sync_parks_trails
"""

from django.core.management.base import BaseCommand
from trails.models import Park, Trail
from users.nps_service import NPS
from users.recreation_trails_service import RecreationTrailService, CombinedParkTrailService
from django.utils import timezone
import time


class Command(BaseCommand):
    help = "Sync parks and trails from NPS and Recreation.gov APIs"

    def add_arguments(self, parser):
        parser.add_argument("--state", type=str, 
                            help="Two-letter state code to sync (e.g., MN). If not provided, syncs all states.",)
        parser.add_argument("--limit", type=int, default=None,
                            help="Limit number of parks to process per state",)
        parser.add_argument("--test", action="store_true",
                            help="Test mode - only sync first 2 parks",)

    def handle(self, *args, **options):
        state = options.get("state")
        limit = options.get("limit")
        test_mode = options.get("test", False)
        
        nps_service = NPS()
        recreation_service = RecreationTrailService()
        combined_service = CombinedParkTrailService(nps_service, recreation_service)
        
        self.stdout.write(self.style.SUCCESS("Starting park and trail sync..."))
        
        if test_mode:
            self.stdout.write(self.style.WARNING("TEST MODE: Syncing only 2 parks from MN"))
            self.sync_state("MN", combined_service, limit=2)
        elif state:
            # Sync specific state
            self.sync_state(state.upper(), combined_service, limit)
        else:
            # Sync all states
            states = [
                "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
            ]
            
            for state_code in states:
                self.stdout.write(f"\nProcessing state: {state_code}")
                try:
                    self.sync_state(state_code, combined_service, limit)
                    time.sleep(2)  # Rate limiting between states
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error with {state_code}: {str(e)}"))
                    continue
        
        self.stdout.write(self.style.SUCCESS("\n=== Sync completed! ==="))
        self.stdout.write(f"Total parks in database: {Park.objects.count()}")
        self.stdout.write(f"Total trails in database: {Trail.objects.count()}")

    def sync_state(self, state_code, combined_service, limit=None):
        """Sync parks and trails for a specific state"""
        try:
            # Get parks with trails
            parks_data = combined_service.get_parks_with_trails_by_state(state_code)
            
            if not parks_data:
                self.stdout.write(self.style.WARNING(f'  No parks found for {state_code}'))
                return
            
            if limit:
                parks_data = parks_data[:limit]
            
            parks_created = 0
            parks_updated = 0
            trails_created = 0
            trails_updated = 0
            
            for park_with_trails in parks_data:
                try:
                    # Extract park data from the nested structure
                    park_info = park_with_trails.get('park', {})
                    trails_info = park_with_trails.get('trails', [])
                    
                    park_code = park_info.get('code')
                    if not park_code:
                        self.stdout.write(self.style.WARNING(f'  ⚠ Skipping park with no code'))
                        continue
                    
                    # Create or update park
                    park, created = Park.objects.update_or_create(
                        nps_park_code=park_code,
                        defaults={
                            'park_name': park_info.get('name', 'Unknown Park'),
                            'state': park_info.get('state', state_code),
                            'region': '',  # Not provided in this format
                            'description': (park_info.get('description', '') or '')[:500],
                            'park_url': park_info.get('url', ''),
                            'last_synced': timezone.now()
                        }
                    )
                    
                    if created:
                        parks_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Created park: {park.park_name}'))
                    else:
                        parks_updated += 1
                        self.stdout.write(f'  ↻ Updated park: {park.park_name}')
                    
                    # Sync trails for this park
                    if trails_info:
                        for trail_data in trails_info:
                            try:
                                trail, trail_created = self.create_or_update_trail(park, trail_data)
                                
                                if trail_created:
                                    trails_created += 1
                                    self.stdout.write(f'    ✓ Created trail: {trail.name}')
                                else:
                                    trails_updated += 1
                            except Exception as e:
                                self.stdout.write(self.style.WARNING(f'    ⚠ Error with trail: {str(e)}'))
                                continue
                    else:
                        self.stdout.write(f'    No trails found for {park.park_name}')
                
                except Exception as e:
                    park_name = park_with_trails.get('park', {}).get('name', 'Unknown')
                    self.stdout.write(self.style.ERROR(f'  ✗ Error with park {park_name}: {str(e)}'))
                    continue
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n  {state_code} Summary: '
                    f'Parks [Created: {parks_created}, Updated: {parks_updated}] | '
                    f'Trails [Created: {trails_created}, Updated: {trails_updated}]'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'  Error syncing {state_code}: {str(e)}')
            )

    def create_or_update_trail(self, park, trail_data):
        """Create or update a trail"""
        
        # Map difficulty levels
        difficulty_map = {
            "EASY": "easy",
            "EASIEST": "easy",
            "MODERATE": "moderate",
            "MODERATELY STRENUOUS": "moderate",
            "STRENUOUS": "moderate",
            "DIFFICULT": "hard",
            "VERY DIFFICULT": "hard",
            "VERY STRENUOUS": "expert",
            "EXTREMELY DIFFICULT": "expert",
        }
        
        difficulty = trail_data.get("difficulty", "moderate")
        if isinstance(difficulty, str) and difficulty.upper() in difficulty_map:
            difficulty = difficulty_map[difficulty.upper()]
        else:
            difficulty = "moderate"
        
        # Create unique ID from trail data
        trail_unique_id = trail_data.get("id") or f"{park.nps_park_code}_{trail_data.get('name', '').replace(' ', '_')[:50]}"
        
        # Get length and ensure it"s a valid number
        length = trail_data.get("length", 0)
        try:
            length = float(length) if length else 0.0
        except (ValueError, TypeError):
            length = 0.0
        
        # Get elevation gain
        elevation_gain = trail_data.get("elevation_gain")
        try:
            elevation_gain = int(elevation_gain) if elevation_gain else None
        except (ValueError, TypeError):
            elevation_gain = None
        
        trail, created = Trail.objects.update_or_create(
            nps_trail_id=trail_unique_id,
            defaults={
                "park": park,
                "name": trail_data.get("name", "Unnamed Trail")[:200],
                "description": trail_data.get("description", "")[:500],
                "location": trail_data.get("location", park.state)[:200],
                "decimal_latitude": trail_data.get("latitude"),
                "decimal_longitude": trail_data.get("longitude"),
                "difficulty": difficulty,
                "decimal_length_miles": length,
                "elevation_gain_ft": elevation_gain,
                "trail_type": trail_data.get("trail_type", "")[:50],
                "featured_photo_url": trail_data.get("image_url", "")[:500],
                "is_active": True,
                "last_synced": timezone.now()
            }
        )
        
        return trail, created