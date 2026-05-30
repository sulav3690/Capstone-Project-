import json
from django_redis import get_redis_connection


class RedisClient:
    """
    Utility wrapper for custom Redis operations.
    Handles serialization and raw commands with safety try/catch blocks.
    """
    @staticmethod
    def get_connection():
        return get_redis_connection("default")

    @classmethod
    def set_json(cls, key, value, expire_seconds=None):
        """
        Stores any python structure (dict, list, string) as a JSON string in Redis.
        """
        try:
            r = cls.get_connection()
            serialized = json.dumps(value)
            if expire_seconds:
                r.set(key, serialized, ex=expire_seconds)
            else:
                r.set(key, serialized)
            return True
        except Exception:
            return False

    @classmethod
    def get_json(cls, key):
        """
        Fetches a JSON string from Redis and parses it back to python objects.
        """
        try:
            r = cls.get_connection()
            data = r.get(key)
            if data:
                # Handle bytes encoding from redis-py
                if isinstance(data, bytes):
                    data = data.decode('utf-8')
                return json.loads(data)
            return None
        except Exception:
            return None

    @classmethod
    def delete(cls, key):
        """
        Deletes a key from Redis.
        """
        try:
            r = cls.get_connection()
            r.delete(key)
            return True
        except Exception:
            return False
