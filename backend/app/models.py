from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    """جدول کاربران"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ارتباط: یک کاربر می‌تونه چندین بورد بسازه (owner)
    owned_boards = relationship("Board", back_populates="owner")


class Board(Base):
    """جدول بوردها (مثل یک پروژه - 'پروژه فروشگاه')"""
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="owned_boards")
    # یک بورد می‌تونه چندین ستون (List) داشته باشه
    lists = relationship("List", back_populates="board", cascade="all, delete-orphan")
    members = relationship("BoardMember", back_populates="board", cascade="all, delete-orphan")


class BoardMember(Base):
    """جدول واسط: کدوم کاربرها به کدوم بورد دسترسی دارن"""
    __tablename__ = "board_members"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    board = relationship("Board", back_populates="members")
    user = relationship("User")


class List(Base):
    """جدول ستون‌ها (مثل To Do, In Progress, Done)"""
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    position = Column(Integer, default=0)  # ترتیب نمایش ستون‌ها

    board = relationship("Board", back_populates="lists")
    # یک ستون می‌تونه چندین کارت داشته باشه
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan")


class Card(Base):
    """جدول کارت‌ها (تسک‌ها)"""
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    list_id = Column(Integer, ForeignKey("lists.id"), nullable=False)
    position = Column(Integer, default=0)  # ترتیب نمایش کارت در ستون
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    list = relationship("List", back_populates="cards")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan")


class Comment(Base):
    """جدول کامنت‌های روی کارت‌ها"""
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    card = relationship("Card", back_populates="comments")
    user = relationship("User")
