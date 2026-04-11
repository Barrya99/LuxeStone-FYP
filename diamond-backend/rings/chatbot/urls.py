from django.urls import path
from .views import ChatView, ChatClearView, ChatHistoryView

urlpatterns = [
    path("", ChatView.as_view(), name="chat"),
    path("clear/", ChatClearView.as_view(), name="chat-clear"),
    path("history/", ChatHistoryView.as_view(), name="chat-history"),
]