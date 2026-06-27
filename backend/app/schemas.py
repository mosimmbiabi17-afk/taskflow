from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List as TypingList


# ---------- User ----------
class UserCreate(BaseModel):
    """داده‌ای که هنگام ثبت‌نام از کاربر می‌گیریم"""
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """داده‌ای که هنگام ورود از کاربر می‌گیریم"""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """داده‌ای که در پاسخ به کلاینت نشون می‌دیم (بدون پسورد!)"""
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True  # اجازه می‌ده مستقیم از مدل SQLAlchemy بسازیمش


class Token(BaseModel):
    """پاسخ بعد از لاگین موفق"""
    access_token: str
    token_type: str = "bearer"


# ---------- Comment ----------
class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    content: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Card ----------
class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    list_id: int
    position: Optional[int] = 0


class CardUpdate(BaseModel):
    """برای ویرایش کارت - همه فیلدها اختیاریه چون شاید فقط یکی رو عوض کنیم"""
    title: Optional[str] = None
    description: Optional[str] = None
    list_id: Optional[int] = None  # برای جابجایی بین ستون‌ها
    position: Optional[int] = None


class CardOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    list_id: int
    position: int

    class Config:
        from_attributes = True


# ---------- List ----------
class ListCreate(BaseModel):
    title: str
    board_id: int
    position: Optional[int] = 0


class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None


class ListOut(BaseModel):
    id: int
    title: str
    board_id: int
    position: int
    cards: TypingList[CardOut] = []

    class Config:
        from_attributes = True


# ---------- Board ----------
class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str
    owner_id: int

    class Config:
        from_attributes = True


class BoardDetailOut(BoardOut):
    """جزئیات کامل بورد همراه با ستون‌ها و کارت‌هاش"""
    lists: TypingList[ListOut] = []
