using ECommerce.Infrastructure;
using ECommerce.Application;

namespace ECommerce.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDI(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddInfrastructure(configuration);
            services.AddApplication();
            return services;
        }
    }
}