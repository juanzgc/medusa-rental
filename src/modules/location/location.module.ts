import { Module } from "medusa-extender"
import { LocationService } from './location.service';
import { Location } from "./location.entity"
import { LocationRepository } from "./location.repository"
import { location1651213494792 } from "./1651213494792-location.migration"

@Module({
  imports: [Location, LocationRepository, location1651213494792, LocationService],
})
export class LocationModule {}
