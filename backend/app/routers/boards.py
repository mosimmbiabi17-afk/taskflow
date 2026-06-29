from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List as TypingList

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/boards", tags=["Boards"])


def get_board_or_404(board_id: int, db: Session, user: models.User) -> models.Board:
    """تابع کمکی: بورد رو پیدا می‌کنه و چک می‌کنه کاربر بهش دسترسی داره یا نه"""
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="بورد پیدا نشد")

    is_owner = board.owner_id == user.id
    is_member = any(m.user_id == user.id for m in board.members)
    if not (is_owner or is_member):
        raise HTTPException(status_code=403, detail="دسترسی به این بورد ندارید")
    return board


@router.get("", response_model=TypingList[schemas.BoardOut])
def list_boards(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """لیست بوردهایی که کاربر مالک یا عضوشونه"""
    member_ids = (
        db.query(models.BoardMember.board_id)
        .filter(models.BoardMember.user_id == current_user.id)
        .subquery()
    )
    return (
        db.query(models.Board)
        .filter(
            or_(
                models.Board.owner_id == current_user.id,
                models.Board.id.in_(member_ids),
            )
        )
        .all()
    )


@router.post("", response_model=schemas.BoardOut, status_code=status.HTTP_201_CREATED)
def create_board(
    board: schemas.BoardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """ساخت بورد جدید"""
    new_board = models.Board(title=board.title, owner_id=current_user.id)
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return new_board


@router.get("/{board_id}", response_model=schemas.BoardDetailOut)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """جزئیات کامل بورد همراه ستون‌ها و کارت‌ها"""
    return get_board_or_404(board_id, db, current_user)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """حذف بورد (فقط مالک می‌تونه حذف کنه)"""
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="بورد پیدا نشد")
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="فقط مالک بورد می‌تواند آن را حذف کند")

    db.delete(board)
    db.commit()
    return None
