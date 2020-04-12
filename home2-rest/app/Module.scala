import java.time.Clock

import com.google.inject.AbstractModule
import jobs.AuthenticationInit

class Module extends AbstractModule {
  override def configure(): Unit = {
    bind(classOf[Clock]).toInstance(Clock.systemUTC())
    bind(classOf[AuthenticationInit]).asEagerSingleton()
  }
}
