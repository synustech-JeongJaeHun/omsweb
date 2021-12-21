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

    public IQueryable<TokenHistoryEntity> QueryTokenHistory()
    {
        return this._repo.QueryTokenHistory();
    }

    public IQueryable<UserEntity> QueryUsers()
    {
      return this._repo.QueryUsers();
    }
    public IQueryable<PermissionEntity> QueryPermissions()
    {
      // return this._repo.QueryPermissions();
      return Enum.GetValues(typeof(UserPermissions))
        .Cast<UserPermissions>()
        .Select(p => new PermissionEntity { Id = (int)p, Name = p.ToString() })
        .AsQueryable();
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
      if (user == null) //throw new OmsException(ErrorCodes.AuthenticationFailed);  //UserNotExists
        return null;

      var verified = BCrypt.Net.BCrypt.Verify(password, user.Password);
      if (!verified) //throw new OmsException(ErrorCodes.AuthenticationFailed);
        return null;

      var tokenResponse = new TokenResponse
      {
        Token = GenerateUserToken(user)
      };
      var validTo = this.GetTokenValidTo(tokenResponse.Token);

      this._repo.AddTokenHistory(user, validTo,nameof(Authenticate));

      return tokenResponse;
    }

    public TokenResponse RenewToken()
    {
      var user = this._repo.GetUserById(this.UserId);

      if (user == null) //throw new OmsException(ErrorCodes.AuthenticationFailed);
        return null;

      var tokenResponse = new TokenResponse
      {
        Token = GenerateUserToken(user)
      };
      var validTo = this.GetTokenValidTo(tokenResponse.Token);
 
      this._repo.AddTokenHistory(user, validTo, nameof(RenewToken));

      return tokenResponse;
    }

    public void Logout()
    {
        var user = this._repo.GetUserById(this.UserId);

        var tokenString = this._context.Request.Headers["Authorization"].ToString().Split(" ")[1];
        var validTo = this.GetTokenValidTo(tokenString);

        this._repo.AddTokenHistory(user, validTo, nameof(Logout));
    }

    private DateTime GetTokenValidTo(string tokenString)
    {
        var jwtHandler = new JwtSecurityTokenHandler();

        var token = jwtHandler.ReadJwtToken(tokenString);
        return token.ValidTo;
    }

    private string GenerateUserToken(UserEntity userEntity)
    {
      if (this.IsAdministrators(userEntity))
      {
        userEntity.Permissions = this.GetAdministratorPermissions();
      }

      var secret = this._appSettings.JwtSecret;
      var jwtHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(secret);

      var claims = new[] {
        new Claim(ClaimTypes.Name, userEntity.Id.ToString()),
        new Claim("id", userEntity.Id.ToString()),
        new Claim("userId", userEntity.UserId),
        new Claim("email", userEntity.Email),
        new Claim("firstName", userEntity.FirstName),
        new Claim("lastName", userEntity.LastName ?? ""),
        new Claim("roles", String.Join<int>(",", userEntity.Roles)),
        new Claim("permissions", String.Join<int>(",", userEntity.Permissions)),
      };
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.Now.AddMinutes(_appSettings.JwtLifeMinutes),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };
      var token = jwtHandler.CreateToken(tokenDescriptor);

      return jwtHandler.WriteToken(token);
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

    public int AddUser(AccountFormDto accountFormDto)
    {
      accountFormDto.Password = BCrypt.Net.BCrypt.HashPassword(accountFormDto.Password);
      return this._repo.AddUser(accountFormDto);
    }

    public int UpdateUser(AccountFormDto accountFormDto)
    {
      accountFormDto.Password = BCrypt.Net.BCrypt.HashPassword(accountFormDto.Password);
      return this._repo.UpdateUser(accountFormDto);
    }

    public int UpdateUserWithoutPassword(AccountFormDto accountFormDto)
    {
      return this._repo.UpdateUserWithoutPassword(accountFormDto);
    }

    public int DeleteUser(string id)
    {
      return this._repo.DeleteUser(id);
    }

    public int InsertRolePermissions(RoleFormDto role)
    {
      //role.Id;
      //role.Name;
      //role.Permissions;
      return this._repo.InsertRolePermissions(role);
    }

    public int UpdateRolePermissions(RoleFormDto role)
    {
      return this._repo.UpdateRolePermissions(role);
    }

    public int DeleteRole(int roleId)
    {
      return this._repo.DeleteRole(roleId);
    }
  }
}