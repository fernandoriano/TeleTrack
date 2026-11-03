from getpass import getpass

from sqlalchemy.orm import Session

from app import models
from app.auth import hash_password
from app.database import SessionLocal


def create_initial_engineer(db: Session) -> None:
    existing_engineer = (
        db.query(models.User)
        .filter(models.User.role == "engineer")
        .first()
    )

    if existing_engineer is not None:
        print()
        print("An engineer account already exists.")
        print(
            f"Username: {existing_engineer.username}"
        )
        print()
        print(
            "Bootstrap was cancelled to avoid "
            "creating duplicate engineer accounts."
        )
        return

    print()
    print("======================================")
    print(" TeleTrack - Initial Engineer Setup")
    print("======================================")
    print()

    while True:
        username = input(
            "Engineer username: "
        ).strip()

        if len(username) >= 4:
            break

        print(
            "Username must contain at least "
            "4 characters."
        )

    while True:
        full_name = input(
            "Engineer full name: "
        ).strip()

        if len(full_name) >= 2:
            break

        print(
            "Full name must contain at least "
            "2 characters."
        )

    email = input(
        "Engineer email (optional): "
    ).strip()

    if email == "":
        email = None

    while True:
        password = getpass(
            "Engineer password: "
        )

        if len(password) < 8:
            print(
                "Password must contain at least "
                "8 characters."
            )
            continue

        password_confirmation = getpass(
            "Confirm password: "
        )

        if password != password_confirmation:
            print(
                "Passwords do not match. "
                "Try again."
            )
            continue

        break

    existing_username = (
        db.query(models.User)
        .filter(
            models.User.username == username
        )
        .first()
    )

    if existing_username is not None:
        print()
        print(
            "That username already exists."
        )
        return

    engineer = models.User(
        client_id=None,
        username=username,
        password_hash=hash_password(
            password
        ),
        full_name=full_name,
        email=email,
        role="engineer",
        active=True
    )

    try:
        db.add(engineer)
        db.commit()
        db.refresh(engineer)

        print()
        print("======================================")
        print(" Engineer created successfully")
        print("======================================")
        print(
            f"ID: {engineer.id}"
        )
        print(
            f"Username: {engineer.username}"
        )
        print(
            f"Role: {engineer.role}"
        )
        print(
            f"Active: {engineer.active}"
        )
        print()
        print(
            "The password was stored as a "
            "secure hash."
        )

    except Exception:
        db.rollback()
        raise


def main() -> None:
    db = SessionLocal()

    try:
        create_initial_engineer(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
    