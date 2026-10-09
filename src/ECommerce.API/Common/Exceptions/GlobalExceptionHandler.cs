using ECommerce.Application.Common.Exceptions;
using ECommerce.Domain.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

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
        _logger.LogError(
            exception,
            "An unhandled exception occurred.");

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

        await Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "An unexpected error occurred.",
            detail: "An unexpected error occurred while processing your request.")
            .ExecuteAsync(httpContext);

        return true;
    }
}