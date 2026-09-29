using AutoMapper;
using ECommerce.Application.Common.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);

            cfg.AddOpenBehavior(
                typeof(ValidationBehavior<,>));
        });
        services.AddAutoMapper(cfg =>
        {
            
        }, assembly);

        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}