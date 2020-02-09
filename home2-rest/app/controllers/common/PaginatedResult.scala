package controllers.common

import models.common.Pagination
import play.api.http.Writeable
import play.api.libs.json.{Json, Writes}

case class PaginatedResult[T](pagination: Pagination, data: Seq[T]) {
}
object PaginatedResult {
  implicit def jsonWriter[T](implicit writer: Writes[T]): Writes[PaginatedResult[T]] = Json.writes[PaginatedResult[T]]
  implicit def jsonWriteable[T](implicit w: Writeable[T], writer: Writes[T]): Writeable[PaginatedResult[T]] = Writeable.writeableOf_JsValue.map[PaginatedResult[T]](Json.toJson)
}