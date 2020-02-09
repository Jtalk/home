package utils

import play.api.libs.json._
import utils.Extension._

import scala.util.Try

object JsonUtils {

  def asObj[T](js: Option[JsValue])(implicit reads: Reads[T]): Option[T] = js.flatMap(Json.fromJson(_).asOpt)
  def asObj[T](js: JsValue)(implicit reads: Reads[T]): Try[T] = Json.fromJson(js)
    .asEither
    .left.map(asException)
    .asTry

  def asMessage(path: JsPath, errors: Seq[JsonValidationError]): String = errors match {
    case Seq() => path.toJsonString + " -> Unknown"
    case errs => path.toJsonString + " -> " + errs.flatMap(_.messages).fold("")(_ + ", " + _)
  }

  def asException(errors: Seq[(JsPath, Seq[JsonValidationError])]): Exception = "Error(s) parsing JSON: \n" + errors
    .map(p => asMessage(p._1, p._2))
    .fold("")(_ + "\n" + _) |> (new Exception(_))
}