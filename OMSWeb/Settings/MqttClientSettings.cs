namespace OMSWeb.MqttSettings
{
    public class MqttClientSettings
    {
        public string Id { set; get; }
        public string UserName { set; get; }
        public string Password { set; get; }

        public MqttClientSettings()
        {
        }

        public MqttClientSettings(string id, string username, string password)
        {
            Id = id;
            UserName = username;
            Password = password;
        }
    }
}
