#!/usr/bin/env python
"""
LuxeStone Chatbot Direct Testing Script

Run this to test the chatbot without needing the frontend.
Helpful for debugging because you see all the [DEBUG] logs.

Usage:
    # In Django shell
    python manage.py shell
    
    # Then run this script content
    
Or use:
    python manage.py shell < chatbot_test.py
"""

import os
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diamond_project.settings')

import django
django.setup()

from rings.chatbot.agent import get_agent
import uuid

print("\n" + "="*80)
print("LuxeStone Chatbot Direct Tester")
print("="*80)
print("\nThis will send test messages to the chatbot and show you ALL debug output.\n")

# Test cases
test_cases = [
    {
        "name": "Budget Query",
        "message": "I am looking for diamond and my budget is $5000",
        "description": "Test budget detection and diamond search"
    },
    {
        "name": "Shape + Budget",
        "message": "Show me round diamonds under $3000",
        "description": "Test shape detection + budget"
    },
    {
        "name": "Knowledge Question",
        "message": "What is the difference between lab-grown and natural diamonds?",
        "description": "Test knowledge base tool"
    },
    {
        "name": "Setting Search",
        "message": "I like white gold settings with halo design",
        "description": "Test setting search"
    },
    {
        "name": "Generic Diamond Query",
        "message": "Show me some diamonds",
        "description": "Test generic diamond search without budget"
    },
]

# Interactive mode
print("Available test cases:")
for idx, test in enumerate(test_cases, 1):
    print(f"{idx}. {test['name']} - {test['description']}")
print(f"{len(test_cases) + 1}. Enter custom message")
print("0. Exit")

choice = input("\nSelect test case (0-" + str(len(test_cases) + 1) + "): ").strip()

try:
    choice_num = int(choice)
    if choice_num == 0:
        print("Exiting.")
        sys.exit(0)
    elif 1 <= choice_num <= len(test_cases):
        test = test_cases[choice_num - 1]
        message = test["message"]
        print(f"\n✓ Selected: {test['name']}")
        print(f"  Description: {test['description']}")
        print(f"  Message: {message}")
    elif choice_num == len(test_cases) + 1:
        message = input("Enter your custom message: ").strip()
        if not message:
            print("✗ Empty message! Exiting.")
            sys.exit(1)
        print(f"✓ Custom message: {message}")
    else:
        print("✗ Invalid choice!")
        sys.exit(1)
except ValueError:
    print("✗ Invalid input!")
    sys.exit(1)

# Initialize agent
session_id = str(uuid.uuid4())
print(f"\n{'='*80}")
print("Starting chat session...")
print(f"Session ID: {session_id}")
print(f"{'='*80}")

agent = get_agent(session_id=session_id, user_id=None)

# Send message (all debug output will be printed)
print("\nSending message to agent...\n")
response = agent.chat(message)

# Display result
print("\n" + "="*80)
print("FINAL RESPONSE")
print("="*80)
print(f"\nAgent Response ({len(response)} chars):\n")
print(response)
print("\n" + "="*80)

# Ask for follow-up
while True:
    follow_up = input("\nEnter follow-up question (or 'exit' to quit): ").strip()
    if follow_up.lower() == 'exit':
        break
    if not follow_up:
        continue
    
    print(f"\n{'─'*80}")
    print("Processing follow-up...\n")
    response = agent.chat(follow_up)
    
    print("\n" + "="*80)
    print("RESPONSE")
    print("="*80)
    print(f"\n{response}\n")

print("\n✓ Test complete!")
