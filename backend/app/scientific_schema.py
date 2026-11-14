from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

class CoordinatesSchema(BaseModel):
    model_config = ConfigDict(extra='allow')
    body: Literal['Earth', 'Moon', 'Mars']
    latitude_deg: float = Field(ge=-90, le=90)
    longitude_east_deg: float = Field(ge=-180, le=180)
    reference_system: str
    earth_epsg: int | None
    earth_map_eligible: bool

    @model_validator(mode='after')
    def check_body_frame(self):
        if self.body == 'Earth':
            if self.earth_epsg != 4326 or not self.earth_map_eligible:
                raise ValueError('Earth site must use its WGS84 frame')
        elif self.earth_epsg is not None or self.earth_map_eligible:
            raise ValueError('Planetary sites cannot use Earth map coordinates')
        return self

class MeasurementSchema(BaseModel):
    model_config = ConfigDict(extra='allow')
    variable: str
    value: Any
    unit: str | None
    data_class: str
    source_id: str
    source_url: str
    missing: bool

class SiteDocumentSchema(BaseModel):
    model_config = ConfigDict(extra='allow')
    site_id: str
    site_name: str
    body: Literal['Earth', 'Moon', 'Mars']
    coordinates: CoordinatesSchema
    site_verification_status: str
    environmental_measurements: list[MeasurementSchema]
    time_series: dict[str, dict[str, Any]]
    site_level_values: dict[str, Any]

    @model_validator(mode='after')
    def check_body_link(self):
        if self.coordinates.body != self.body:
            raise ValueError('Coordinate body does not match site body')
        return self
