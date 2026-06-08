from .client import ZizkaDB
from .exceptions import ZizkaDBError, AuthError, NotFoundError

__all__ = ["ZizkaDB", "ZizkaDBError", "AuthError", "NotFoundError"]
__version__ = "0.2.3"
