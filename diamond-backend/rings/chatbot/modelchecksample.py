from google import genai

client = genai.Client(api_key="AIzaSyBilwlvzqGyI5KEdPqp-ppgcp1aLS7Sa4c")

for m in client.models.list():
    print(m.name)