namespace ECommerce.Application.Common.Exceptions;

public sealed class IdentityException : Exception
{
    public IdentityException(string message)
        : base(message)
    {
    }
}