using System;
using System.Threading.Tasks;
using OMSWeb.Models;

namespace OMSWeb.Services
{
  public class MessageService
  {
    public Task SendMessage(CommandMessageDto command)
    {
      Console.WriteLine($"# SendMessage -> {command.Type}, {command.Action}, {command.OrderId}");
      // @TODO 로직 구현 - protocol 확인
      return Task.CompletedTask;
    }
  }
}