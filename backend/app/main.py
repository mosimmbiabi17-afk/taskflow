from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, boards, lists, cards

# این خط همه جدول‌ها رو در دیتابیس SQLite می‌سازه (اگه قبلاً نساخته باشه)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="API برای سیستم مدیریت وظایف تیمی - پروژه پورتفولیو محسن",
    version="1.0.0",
)

# CORS: اجازه می‌ده فرانت‌اند React (که روی پورت دیگه‌ای اجرا می‌شه) بتونه به این API درخواست بزنه
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # در پروژه واقعی باید فقط دامنه فرانت‌اند رو بنویسیم
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# اتصال همه روترها به اپلیکیشن اصلی
app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(lists.router)
app.include_router(cards.router)


@app.get("/")
def root():
    """صفحه اصلی API - فقط برای تست اینکه سرور بالاست"""
    return {"message": "Task Manager API is running 🚀"}
