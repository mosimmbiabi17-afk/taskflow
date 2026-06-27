from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from .boards import get_board_or_404

router = APIRouter(prefix="/lists", tags=["Lists"])


@router.post("", response_model=schemas.ListOut, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: schemas.ListCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """ساخت ستون جدید داخل یک بورد"""
    # چک می‌کنیم کاربر به این بورد دسترسی داره
    get_board_or_404(list_data.board_id, db, current_user)

    new_list = models.List(
        title=list_data.title,
        board_id=list_data.board_id,
        position=list_data.position,
    )
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


@router.put("/{list_id}", response_model=schemas.ListOut)
def update_list(
    list_id: int,
    list_data: schemas.ListUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """ویرایش عنوان یا جای ستون (برای Drag & Drop)"""
    db_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="ستون پیدا نشد")

    get_board_or_404(db_list.board_id, db, current_user)

    if list_data.title is not None:
        db_list.title = list_data.title
    if list_data.position is not None:
        db_list.position = list_data.position

    db.commit()
    db.refresh(db_list)
    return db_list


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """حذف ستون (همه کارت‌های داخلش هم حذف می‌شن - cascade)"""
    db_list = db.query(models.List).filter(models.List.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="ستون پیدا نشد")

    get_board_or_404(db_list.board_id, db, current_user)

    db.delete(db_list)
    db.commit()
    return None
