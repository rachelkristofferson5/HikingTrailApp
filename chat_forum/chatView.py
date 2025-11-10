from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from .models import Chat

@login_required
def chatView(request):
    chats = Chat.objects.filter(parent__isnull=True).order_by('-created_at')
    return render(request, "chatTemp.html", {"chats": chats})

@login_required
def add_chat(request):

    if request.method == "POST":
        msg = request.POST.get("message")
        parent_id = request.POST.get("parent_id")
        parent = Chat.objects.get(id=parent_id) if parent_id else None
        Chat.objects.create(user=request.user, message=msg, parent=parent)
    return redirect("chat")

def edit_chat(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    if request.method == "POST":
        chat.text = request.POST.get("message")
        chat.save()
        return redirect("chat")
    return render(request, "editChat.html", {"chat": chat})

def delete_chat(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    if request.method == "POST":
        chat.delete()
        return redirect("chat")
    return render(request, "deleteChat.html", {"chat": chat})
