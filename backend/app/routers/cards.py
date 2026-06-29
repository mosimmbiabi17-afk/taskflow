from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List as TypingList

from .. import models, schemas, auth
from ..database import get_db
from .boards import get_board_or_404

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.post("", response_model=schemas.CardOut, status_code=status.HTTP_201_CREATED)
def create_card(
    card_data: schemas.CardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """ساخت کارت (تسک) جدید داخل یک ستون"""
    db_list = db.query(models.List).filter(models.List.id == card_data.list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="ستون پیدا نشد")

    get_board_or_404(db_list.board_id, db, current_user)

    new_card = models.Card(
        title=card_data.title,
        description=card_data.description,
        list_id=card_data.list_id,
        position=card_data.position,
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card


@router.put("/{card_id}", response_model=schemas.CardOut)
def update_card(
    card_id: int,
    card_data: schemas.CardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    ویرایش کارت - این مهم‌ترین API برای Drag & Drop هست.
    وقتی کاربر کارت رو بین ستون‌ها می‌کشه، list_id عوض می‌شه.
    """
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="کارت پیدا نشد")

    current_list = db.query(models.List).filter(models.List.id == db_card.list_id).first()
    get_board_or_404(current_list.board_id, db, current_user)

    if card_data.title is not None:
        db_card.title = card_data.title
    if card_data.description is not None:
        db_card.description = card_data.description
    if card_data.list_id is not None:
        db_card.list_id = card_data.list_id
    if card_data.position is not None:
        db_card.position = card_data.position

    db.commit()
    db.refresh(db_card)
    return db_card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """حذف کارت"""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="کارت پیدا نشد")

    current_list = db.query(models.List).filter(models.List.id == db_card.list_id).first()
    get_board_or_404(current_list.board_id, db, current_user)

    db.delete(db_card)
    db.commit()
    return None


@router.post("/{card_id}/comments", response_model=schemas.CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    card_id: int,
    comment_data: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """افزودن کامنت به یک کارت"""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="کارت پیدا نشد")

    new_comment = models.Comment(
        content=comment_data.content,
        card_id=card_id,
        user_id=current_user.id,
    )
    db.add(new_comment)
    db.commit()
    return (
        db.query(models.Comment)
        .options(joinedload(models.Comment.user))
        .filter(models.Comment.id == new_comment.id)
        .first()
    )


@router.get("/{card_id}/comments", response_model=TypingList[schemas.CommentOut])
def get_comments(card_id: int, db: Session = Depends(get_db)):
    """لیست کامنت‌های یک کارت"""
    return (
        db.query(models.Comment)
        .options(joinedload(models.Comment.user))
        .filter(models.Comment.card_id == card_id)
        .all()
    )
