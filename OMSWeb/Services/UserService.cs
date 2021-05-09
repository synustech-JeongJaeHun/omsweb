using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class UserService
  {
    private readonly UserRepository _repo;
    private readonly AppSettings _appSettings;
    private readonly HttpContext _context;

    public string UserId
    {
      get { return _context?.User?.Identity?.Name; }
    }

    public UserService(UserRepository userRepository, IOptions<AppSettings> appSettings,
      IHttpContextAccessor contextAccessor
    )
    {
      this._repo = userRepository;
      this._appSettings = appSettings.Value;
      this._context = contextAccessor.HttpContext;
    }

    public IQueryable<UserEntity> QueryUsers()
    {
      return this._repo.QueryUsers();
    }
    public IQueryable<PermissionEntity> QueryPermissions()
    {
      return this._repo.QueryPermissions();
    }
    public IQueryable<RoleEntity> QueryRoles()
    {
      return this._repo.QueryRoles();
    }
    public IQueryable<RoleEntity> QueryRolesWithPermissions()
    {
      return this._repo.QueryRolesWithPermissions();
    }

    public TokenResponse Authenticate(string userId, string password)
    {
      var user = this._repo.GetUserByUserId(userId);
      if (user == null) throw new OmsException(ErrorCodes.AuthenticationFailed);
      var verified = BCrypt.Net.BCrypt.Verify(password, user.Password);
      if (!verified) throw new OmsException(ErrorCodes.AuthenticationFailed);

      if (this.IsAdministrators(user))
      {
        user.Permissions = this.GetAdministratorPermissions();
      }

      var secret = this._appSettings.JwtSecret;
      var jwtHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(secret);

      var claims = new[] {
        new Claim(ClaimTypes.Name, user.Id.ToString()),
        new Claim("id", user.Id.ToString()),
        new Claim("userId", user.UserId),
        new Claim("email", user.Email),
        new Claim("firstName", user.FirstName),
        new Claim("lastName", user.LastName ?? ""),
        new Claim("roles", String.Join<int>(",", user.Roles)),
        new Claim("permissions", String.Join<int>(",", user.Permissions)),
      };
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.Now.AddMinutes(_appSettings.JwtLifeMinutes),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };
      var token = jwtHandler.CreateToken(tokenDescriptor);

      return new TokenResponse
      {
        Token = jwtHandler.WriteToken(token),
      };
    }

    private bool IsAdministrators(UserEntity user)
    {
      return user.Id.ToString() == "00000000-0000-0000-0000-000000000000";
    }

    private int[] GetAdministratorPermissions()
    {
      // return Enum.GetValues(typeof(UserPermissions)).OfType<int>().ToArray();
      return Array.ConvertAll((int[])Enum.GetValues(typeof(UserPermissions)), Convert.ToInt32);
    }
  }
}