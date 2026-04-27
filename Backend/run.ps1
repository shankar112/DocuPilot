$Python = "C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe"

& $Python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
