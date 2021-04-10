using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OMSWeb.Models.Entities
{
  public class UserEntity
  {
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    [JsonIgnore]
    public string Password { get; set; }

    public int[] Roles { get; set; }
    public int[] Permissions { get; set; }
  }
}