using ECommerce.Infrastructure;
using ECommerce.Application;
using ECommerce.API.Common.Exceptions;

namespace ECommerce.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDI(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddInfrastructure(configuration);
            services.AddApplication();
            services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();
            return services;
        }
    }
}