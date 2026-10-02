using ECommerce.Infrastructure;
using ECommerce.Application;
using ECommerce.API.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.API.Common.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi;
namespace ECommerce.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDI(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddInfrastructure(configuration);

            var jwtKey = configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT Key is not configured.");

            var jwtIssuer = configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException(
                    "JWT Issuer is not configured.");

            var jwtAudience = configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException(
                    "JWT Audience is not configured.");

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        JwtBearerDefaults.AuthenticationScheme;

                    options.DefaultChallengeScheme =
                        JwtBearerDefaults.AuthenticationScheme;

                    options.DefaultScheme =
                        JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,

                        ValidateAudience = true,
                        ValidAudience = jwtAudience,

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtKey)),

                        ValidateLifetime = true,

                        ClockSkew = TimeSpan.Zero
                    };
                });
                // Add application services
            services.AddApplication();
            // Add API services
            services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();
            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUser, CurrentUser>();


            services.AddAuthorization();
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
                {
                    options.AddSecurityDefinition(
                        "Bearer",
                        new OpenApiSecurityScheme
                        {
                            Type = SecuritySchemeType.Http,
                            Scheme = "bearer",
                            BearerFormat = "JWT",
                            Description = "Enter your JWT token."
                        });

                    options.AddSecurityRequirement(document =>
                        new OpenApiSecurityRequirement
                        {
                            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                        });

                });
            //
            return services;
        }
    }
}