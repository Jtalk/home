package utils

import play.api.libs.json.JsArray

import scala.annotation.tailrec
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

object Extension {
  implicit class FutureOption[T](val fo: Future[Option[T]]) extends AnyVal {
    def fomap[R](f: T => R)(implicit ec: ExecutionContext): Future[Option[R]] = fo.map(_.map(f))
    def oflatMap[R](f: T => Option[R])(implicit ec: ExecutionContext): Future[Option[R]] = fo.map(_.flatMap(f))
    def fflatMap[R](f: T => Future[R])(implicit ec: ExecutionContext): Future[Option[R]] = fo.flatMap(o => o.map(f).map(v => v.map(x => Some(x))).getOrElse(Future.apply(None)))
    def foflatMap[R](f: T => Future[Option[R]])(implicit ec: ExecutionContext): Future[Option[R]] = fflatMap(f).map(o => o.flatten)
    def foget(fallback: => T)(implicit ec: ExecutionContext): Future[T] = fo.map(_.getOrElse(fallback))
  }
  implicit class Opt[T](val o: Option[T]) extends AnyVal {
    def withValue(f: T => Unit): Option[T] = o.map(v => { f(v); v })
    def withNone(f: => Unit): Option[T] = { o.getOrElse(f); o }
  }
  implicit class OptFuture[T](val of: Option[Future[T]]) extends AnyVal {
    def liftFuture(implicit ec: ExecutionContext): Future[Option[T]] = of match {
      case Some(f) => f.map(Some.apply)
      case None => Future.successful(None)
    }
  }
  implicit class SeqOpt[T](val seq: Seq[T]) extends AnyVal {
    def toOpt: Option[Seq[T]] = Some(seq).filter(_.nonEmpty)
  }
  implicit class SeqFuture[T](val future: Future[Seq[T]]) extends AnyVal {
    def fmap[R](f: T => R)(implicit ec: ExecutionContext): Future[Seq[R]] = future.map(_.map(f));
  }
  implicit class JsArrayOpt[T](val array: JsArray) extends AnyVal {
    def toOpt: Option[JsArray] = Some(array).filter(_.value.nonEmpty)
  }
  implicit class ErrorOptionOpt[T](val v: Either[Exception, T]) extends AnyVal {
    def asTry: Try[T] = v match {
      case Right(r) => Success(r)
      case Left(e) => Failure(e)
    }
  }
  implicit class OptionTryOpt[T](val v: Option[Try[T]]) extends AnyVal {
    def liftTry: Try[Option[T]] = v match {
      case None => Success(None)
      case Some(Success(v)) => Success(Some(v))
      case Some(Failure(e)) => Failure(e)
    }
  }
  implicit class SeqTryOpt[T](val v: Seq[Try[T]]) extends AnyVal {
    def liftTry: Try[Seq[T]] = liftTryWith(v, Success(Seq()))

    @tailrec
    private def liftTryWith(seq: Seq[Try[T]], result: Try[Seq[T]]): Try[Seq[T]] = (seq, result) match {
      case (Seq(), result) => result
      case (Success(v) :: rest, Failure(e)) => liftTryWith(rest, Failure(e))
      case (Failure(e2) :: rest, Failure(e)) => liftTryWith(rest, Failure(mergeExceptions(e, e2)))
      case (Success(v) :: rest, Success(vs)) => liftTryWith(rest, Success(vs :+ v))
      case (Failure(e) :: rest, Success(_)) => liftTryWith(rest, Failure(e))
    }
    private def mergeExceptions[E <: Throwable](e1: E, e2: Throwable): E = e1.addSuppressed(e2) |> (_ => e1)
  }
  implicit class FutureTryOpt[T](val v: Future[Try[T]] ) extends AnyVal {
    def consumeTry(implicit ec: ExecutionContext): Future[T] = v.flatMap {
      case Success(v) => Future.successful(v)
      case Failure(e) => Future.failed(e)
    }
  }
  implicit class PipeOp[T](val v: T) extends AnyVal {
    def |>[R](f: T => R): R = f(v)
  }
}
