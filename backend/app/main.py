from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, auth as auth_utils
from .database import engine, SessionLocal
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


def seed_demo_user():
    """
    یک حساب آزمایشی با یک بورد نمونه و چند کارت می‌سازد تا بازدیدکننده‌ها
    بدون ثبت‌نام بتوانند اپ را با داده واقعی امتحان کنند.
    """
    DEMO_EMAIL = "demo@taskflow.app"
    DEMO_PASSWORD = "password"

    db = SessionLocal()
    try:
        demo_user = db.query(models.User).filter(models.User.email == DEMO_EMAIL).first()
        if demo_user:
            return

        demo_user = models.User(
            username="demo",
            email=DEMO_EMAIL,
            hashed_password=auth_utils.hash_password(DEMO_PASSWORD),
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        board = models.Board(title="Launch Plan", owner_id=demo_user.id)
        db.add(board)
        db.commit()
        db.refresh(board)

        lists_data = [
            ("To Do", [
                ("Design homepage", None),
                ("Set up payment API", None),
                ("Write onboarding emails", None),
            ]),
            ("In Progress", [
                ("Auth + JWT", "Add login/register with JWT tokens."),
                ("Drag & drop board", "Native HTML5 drag and drop for cards."),
            ]),
            ("Done", [
                ("Project setup", "Repo, CI, and base folder structure."),
                ("Database schema", "Users, boards, lists, cards, comments."),
            ]),
        ]

        for position, (list_title, card_items) in enumerate(lists_data):
            list_obj = models.List(title=list_title, board_id=board.id, position=position)
            db.add(list_obj)
            db.commit()
            db.refresh(list_obj)

            for card_position, (card_title, card_desc) in enumerate(card_items):
                db.add(models.Card(
                    title=card_title,
                    description=card_desc,
                    list_id=list_obj.id,
                    position=card_position,
                ))
        db.commit()
    finally:
        db.close()


seed_demo_user()
