package utils.security

import java.util
import java.util.Base64

import play.api.libs.json.{Reads, Writes}

import scala.util.{Failure, Success, Try}

object PasswordType extends Enumeration {
  case class Val(hasher: PasswordHasher, checker: PasswordChecker) extends super.Val {
    implicit val writes: Writes[PasswordType] = Writes.enumNameWrites[PasswordType.type]
  }
  type PasswordType = Val
  val PBKDF2WithHmacSHA512: PasswordType = Val(PBKDF2("PBKDF2WithHmacSHA512"), PBKDF2("PBKDF2WithHmacSHA512"))

  implicit val reads: Reads[PasswordType.PasswordType] = Reads.enumNameReads(PasswordType).map(_.asInstanceOf[PasswordType.PasswordType])
}

trait PasswordChecker {
  def check(password: String, hash: String): Boolean
}

trait PasswordHasher {
  def hash(password: String): String
}

object Utils {
  def clearSecret(data: Array[Char]): Unit = util.Arrays.fill(data, 0.asInstanceOf[Char])
  def clearSecret(data: Array[Byte]): Unit = util.Arrays.fill(data, 0.asInstanceOf[Byte])
}

case class SaltedPassword private(hash: Array[Byte], salt: Array[Byte]) {
  lazy val pack: String = Base64.getEncoder.encodeToString(hash) + SaltedPassword.separator + Base64.getEncoder.encodeToString(salt)
  override def toString: String = pack
}

object SaltedPassword {

  val separator = '$'

  def unpack(value: String): Try[SaltedPassword] = {
    val split = value.split(separator)
    if (split.length == 2) {
      val hash = Base64.getDecoder.decode(split(0))
      val salt = Base64.getDecoder.decode(split(1))
      Success(SaltedPassword(hash, salt))
    } else {
      Failure(new RuntimeException("Unexpected salted password format, must be {base64(hash)}${base64(salt)}"))
    }
  }
}