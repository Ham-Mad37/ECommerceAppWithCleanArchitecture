using ECommerce.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Common.Exceptions;

public sealed class GlobalExceptionHandler
    : IExceptionHandler
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

        var statusCode = exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,

            NotFoundException => StatusCodes.Status404NotFound,

            ConflictException => StatusCodes.Status409Conflict,

            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitle(statusCode),
            Detail = GetDetail(exception, statusCode),
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }

    private static string GetTitle(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status400BadRequest =>
                "Validation Error",

            StatusCodes.Status404NotFound =>
                "Resource Not Found",

            StatusCodes.Status409Conflict =>
                "Conflict",

            _ =>
                "Internal Server Error"
        };
    }

    private static string GetDetail(
        Exception exception,
        int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status400BadRequest =>
                exception.Message,

            StatusCodes.Status404NotFound =>
                exception.Message,

            StatusCodes.Status409Conflict =>
                exception.Message,

            _ =>
                "An unexpected error occurred."
        };
    }
}