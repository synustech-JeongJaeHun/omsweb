using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace OMSWeb {
  public static class ValueExtension {
		/// <summary>
		/// null 제거
		/// </summary>
		/// <param name="source"></param>
		/// <returns></returns>
		public static string TryString(this string source)
		{
			if (source == null)
				return string.Empty;

			return source;
		}

		public static string TryString(this object source)
		{
			if (source == null)
				return string.Empty;

			return source.ToString();
		}

		public static int TryInteger(this string source)
		{
			string target = Regex.Match(source, @"^[-+]?[0-9]*").Value;

			if (int.TryParse(target, out int tryValue))
				return tryValue;

			return default;
		}

		public static int TryInteger(this object source)
		{
			return source.ToString().TryInteger();
		}

		public static int? TryIntegerOrNull(this object source)
		{
			string target = source.ToString();

			if (!string.IsNullOrEmpty(target))
				return target.TryInteger();

			return null;
		}

		public static long TryLong(this string source)
		{
			string target = Regex.Match(source, @"^[-+]?[0-9]*").Value;

			if (long.TryParse(target, out long tryValue))
				return tryValue;

			return default;
		}

		public static long TryLong(this object source)
		{
			return source.ToString().TryLong();
		}

		public static long? TryLongOrNull(this object source)
		{
			string target = source.ToString();

			if (!string.IsNullOrEmpty(target))
				return target.TryLong();

			return null;
		}

		public static float TryFloat(this string source)
		{
			if (float.TryParse(source, out float tryValue))
				return tryValue;

			return 0.0f;
		}

		public static float TryFloat(this object source)
		{
			return source.ToString().TryFloat();
		}

		public static float? TryFloatOrNull(this object source)
		{
			string target = source.ToString();

			if (!string.IsNullOrEmpty(target))
				return target.TryFloat();

			return null;
		}

		public static DateTime TryDateTime(this string source)
		{
			if (DateTime.TryParse(source, out DateTime tryValue))
				return tryValue;

			return DateTime.Now;
		}

		public static DateTime TryDateTime(this object source)
		{
			return source.ToString().TryDateTime();
		}

		public static DateTime? TryDateTimeOrNull(this object source)
		{
			string target = source.ToString();

			if (!string.IsNullOrEmpty(target))
				return target.TryDateTime();

			return null;
		}

		public static bool TryBoolean(this string source)
		{
			if (source.Equals("true", StringComparison.InvariantCultureIgnoreCase) ||
				source.Equals("1"))
				return true;
			else if (source.Equals("false", StringComparison.InvariantCultureIgnoreCase) ||
				source.Equals("0"))
				return false;

			return false;
		}

		public static bool TryBoolean(this object source)
		{
			return source.ToString().TryBoolean();
		}

		public static bool? TryBooleanOrNull(this object source)
		{
			string target = source.ToString();

			if (!string.IsNullOrEmpty(target))
				return target.TryBoolean();

			return null;
		}

		public static DateTime TimeStampToDateTime(this long timestamp)
		{
			DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

			return dt.AddSeconds(timestamp).ToLocalTime();
		}

		public static long DateTimeToTimeStamp(this DateTime dt)
		{
			TimeSpan timeSpan = dt - new DateTime(1970, 1, 1, 0, 0, 0);

			return (long)timeSpan.TotalSeconds;
		}

		public static T ToEnum<T>(this object source) where T : unmanaged
		{
			//return (T)Enum.Parse(typeof(T), source.ToString(), true);
			if (Enum.TryParse(source.ToString(), true, out T tryValue))
				return tryValue;

			return default;
		}

		public static string ToUpperFirstChar(this string source)
		{
			if (string.IsNullOrEmpty(source))
				return string.Empty;

			char[] letters = source.ToCharArray();

			letters[0] = char.ToUpper(letters[0]);

			return new string(letters);
		}

		public static string RemoveWhiteSpace(this string html)
		{
			return html.RemoveWhiteSpace(false);
		}

		public static string RemoveWhiteSpace(this string html, bool multiLine)
		{
			string pattern = @"\s*(<[^>]+>)\s*";

			if (multiLine)
				return Regex.Replace(html, pattern, "$1", RegexOptions.Singleline).Trim();
			
			return Regex.Replace(html, pattern, "$1", RegexOptions.Multiline).Trim();
		}

		public static string GetDisplayName(this Enum source)
		{
			return source.GetType()
					.GetMember(source.ToString())
					.First()
					.GetCustomAttribute<DisplayAttribute>()
					.GetName();
		}

		public static IList<T> Clone<T>(this IList<T> source) where T : ICloneable
		{
			return source.Select(item => (T)item.Clone()).ToList();
		}
  }
}