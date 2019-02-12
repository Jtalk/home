package utils

import play.api.http.Writeable
import play.api.http.Writeable._
import play.api.libs.json._
import play.api.mvc.Results._
import play.api.mvc._
import utils.Extension.PipeOp

import scala.concurrent.ExecutionContext

object WebUtils {

  def asHttp[T](v: Option[T])(implicit writeable: Writeable[T]): Result = v match {
    case Some(result) => Ok(result)
    case None => NotFound
  }

  def bodyParser[T](implicit reads: Reads[T], bodyParsers: PlayBodyParsers, ec: ExecutionContext): BodyParser[T] = bodyParsers.json
    .map(asObject(_)(reads))
    .validate(_.left.map(BadRequest.apply[JsValue]))

  private def asEither[T](js: JsResult[T]) = js.asEither.left.map(JsError.toJson)
  private def asObject[T](js: JsValue)(implicit reads: Reads[T]) = Json.fromJson(js) |> asEither

}
