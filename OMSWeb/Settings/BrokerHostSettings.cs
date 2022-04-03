namespace OMSWeb.MqttSettings
{
    public class BrokerHostSettings
    {
        public string Host { set; get; }
        public int Port { set; get; }
        public string TopicRoot { set; get; }

        public BrokerHostSettings()
        {
        }

        public BrokerHostSettings(string host, int port, string topicRoot)
        {
            Host = host;
            Port = port;
            TopicRoot = topicRoot;
        }
    }
}
