package utils

import play.api.libs.json.JsArray

import scala.concurrent.{ExecutionContext, Future}

object Extension {
  implicit class FutureOption[T](val fo: Future[Option[T]]) extends AnyVal {
    def fomap[R](f: T => R)(implicit ec: ExecutionContext): Future[Option[R]] = fo.map(_.map(f))
    def oflatMap[R](f: T => Option[R])(implicit ec: ExecutionContext): Future[Option[R]] = fo.map(_.flatMap(f))
    def fflatMap[R](f: T => Future[R])(implicit ec: ExecutionContext): Future[Option[R]] = fo.flatMap(o => o.map(f).map(v => v.map(x => Some(x))).getOrElse(Future.apply(None)))
    def foflatMap[R](f: T => Future[Option[R]])(implicit ec: ExecutionContext): Future[Option[R]] = fflatMap(f).map(o => o.flatten)
    def foget(fallback: => T)(implicit ec: ExecutionContext): Future[T] = fo.map(_.getOrElse(fallback))
  }
  implicit class SeqOpt[T](val seq: Seq[T]) extends AnyVal {
    def toOpt: Option[Seq[T]] = Some(seq).filter(_.nonEmpty)
  }
  implicit class JsArrayOpt[T](val array: JsArray) extends AnyVal {
    def toOpt: Option[JsArray] = Some(array).filter(_.value.nonEmpty)
  }
  implicit class PipeOp[T](val v: T) extends AnyVal {
    def |>[R](f: T => R): R = f(v)
  }
}
