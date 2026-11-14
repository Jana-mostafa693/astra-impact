from __future__ import annotations

from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")

class Meta(BaseModel):
    model_config = ConfigDict(extra="allow")
    total: Optional[int] = None
    limit: Optional[int] = None
    offset: Optional[int] = None

class Envelope(BaseModel, Generic[T]):
    data: T
    meta: Optional[Meta] = None

class Pagination(BaseModel):
    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)

class ErrorBody(BaseModel):
    error: str
    detail: str

class HealthResponse(BaseModel):
    status: str
    service: str
    dataset: str
    version: str

class TimeSeriesQuery(Pagination):
    limit: int = Field(default=500, ge=1, le=5000)
    site_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = Field(default=None, ge=1, le=12)
    ls: Optional[float] = None
    localtime: Optional[float] = None
    height: Optional[float] = None
    profile_scope: Optional[str] = None
    variables: Optional[str] = None

class AnyRecord(BaseModel):
    model_config = ConfigDict(extra="allow")
    value: Any = None
