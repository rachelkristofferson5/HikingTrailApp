from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from chat import Chat

def chatView(request):
    chats = Chat.objects.order_by('_created_at')[:20] #shows the last 20
    return render(request, "chatTemp.html", {"chats": chats})

@login_required
def add_chat(request):
    if request.method == "POST":
        text = request.POST.get("text")
        if text:
            Chat.objects.create(user=request.user, text=text)
        return redirect("chat")
