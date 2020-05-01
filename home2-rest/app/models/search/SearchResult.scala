package models.search

import models.ModelType.ModelType
import play.api.libs.json._

trait Searchable {}

case class SearchResult[T <: Searchable](score: Float, `type`: String, value: T) {
}

object SearchResult {
  implicit def jsonWriter[T <: Searchable](implicit w: Writes[T]): OWrites[SearchResult[T]] = Json.writes[SearchResult[T]]
  implicit def jsonReader[T <: Searchable](implicit r: Reads[T], m: ModelType[T]): Reads[SearchResult[T]] = Reads[SearchResult[T]] {
    case v: JsObject if v.keys.contains("score") => r.reads(v).map(SearchResult(v("score").as[Float], m.`type`,_))
    case v: JsObject => JsError(JsPath \ "score" -> JsonValidationError("error.path.missing"))
    case null => JsError("Cannot parse null into a SearchResult")
    case v => JsError("Unsupported type, expected JsObject, but got " + v.getClass)
  }
}
