package utils.security

import java.util
import java.util.Base64

import enumeratum.{Enum, EnumEntry, PlayEnum, PlayJsonEnum}

import scala.collection.immutable
import scala.util.{Failure, Success, Try}

sealed trait PasswordType extends EnumEntry {
  def hasher: PasswordHasher
  def checker: PasswordChecker
}

object PasswordType extends Enum[PasswordType] with PlayEnum[PasswordType] with PlayJsonEnum[PasswordType] {
  override def values: immutable.IndexedSeq[PasswordType] = findValues

  case object PBKDF2WithHmacSHA512 extends PasswordType {
    override def hasher: PasswordHasher = PBKDF2("PBKDF2WithHmacSHA512")
    override def checker: PasswordChecker = PBKDF2("PBKDF2WithHmacSHA512")
  }
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