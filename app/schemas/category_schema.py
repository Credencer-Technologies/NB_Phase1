from pydantic import BaseModel


class CategorySchema(BaseModel):
    name: str
    slug: str
    icon: str | None = None
    image_url: str | None = None
    description: str | None = None

    class Config:
        from_attributes = True
