using ECommerce.Application.Common.Exceptions;
using ECommerce.Domain.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace ECommerce.API.Common.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Expected, client-caused errors are warnings; only real bugs are errors.
        if (IsExpected(exception))
        {
            _logger.LogWarning(
                "Handled {ExceptionType}: {Message}",
                exception.GetType().Name,
                exception.Message);
        }
        else
        {
            _logger.LogError(exception, "An unhandled exception occurred.");
        }

        if (exception is ValidationException validationException)
        {
            var errors = validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(x => x.ErrorMessage)
                        .ToArray());

            await Results.ValidationProblem(
                errors,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Validation failed")
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is UnauthorizedAccessException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Unauthorized",
                detail: exception.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is NotFoundException notFoundException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Resource not found",
                detail: notFoundException.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is ConflictException conflictException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: conflictException.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is DomainException domainException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Business rule violation",
                detail: domainException.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is IdentityException identityException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Identity error",
                detail: identityException.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        if (exception is BadHttpRequestException badRequest)
        {
            await Results.Problem(
                statusCode: badRequest.StatusCode,
                title: "Bad request",
                detail: badRequest.Message)
                .ExecuteAsync(httpContext);

            return true;
        }

        // NEW: invalid arguments thrown by domain entities -> 400
        if (exception is ArgumentException argumentException)
        {
            // ArgumentException appends " (Parameter 'x')" to its message; strip it for clients.
            var detail = argumentException.Message;
            var index = detail.IndexOf(" (Parameter", StringComparison.Ordinal);
            if (index >= 0)
                detail = detail[..index];

            await Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid request",
                detail: detail)
                .ExecuteAsync(httpContext);

            return true;
        }

        await Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "An unexpected error occurred.",
            detail: "An unexpected error occurred while processing your request.")
            .ExecuteAsync(httpContext);

        return true;
    }

    private static bool IsExpected(Exception exception) =>
        exception is ValidationException
            or UnauthorizedAccessException
            or NotFoundException
            or ConflictException
            or DomainException
            or IdentityException
            or ArgumentException
            or BadHttpRequestException;
}