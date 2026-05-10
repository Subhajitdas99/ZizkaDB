class AgentDBError(Exception):
    """Base exception for AgentDB SDK."""

    def __init__(self, message: str, status_code: int | None = None):
        self.status_code = status_code
        super().__init__(message)


class AuthError(AgentDBError):
    """Invalid or missing API key."""


class NotFoundError(AgentDBError):
    """Event or agent not found."""


class RateLimitError(AgentDBError):
    """Too many requests."""
