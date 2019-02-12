package utils

import play.api.libs.json._

object JsonUtils {

  def asObj[T](js: Option[JsValue])(implicit reads: Reads[T]): Option[T] = js.flatMap(Json.fromJson(_).asOpt)

}