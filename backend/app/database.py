from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# آدرس دیتابیس SQLite - فایل task_manager.db در همین پوشه ساخته می‌شه
SQLALCHEMY_DATABASE_URL = "sqlite:///./task_manager.db"

# ساخت engine اتصال به دیتابیس
# check_same_thread=False چون SQLite به صورت پیش‌فرض فقط با یک ترد کار می‌کنه
# و ما در FastAPI به چند ترد نیاز داریم
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# ساخت کلاس Session برای تعامل با دیتابیس
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# کلاس پایه که همه مدل‌های ما (User, Board, ...) از این ارث‌بری می‌کنن
Base = declarative_base()


def get_db():
    """
    این تابع یک Session دیتابیس می‌سازه و بعد از اتمام درخواست،
    اون رو می‌بنده. در FastAPI به عنوان Dependency استفاده می‌شه.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
