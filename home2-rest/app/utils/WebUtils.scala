package utils

import play.api.http.Writeable
import play.api.mvc._

object WebUtils extends Results {

  def asHttp[T](v: Option[T])(implicit writeable: Writeable[T]): Result = v match {
    case Some(result) => Ok(result)
    case None => NotFound
  }
}
