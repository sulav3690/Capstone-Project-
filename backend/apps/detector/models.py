import datetime
import mongoengine


class AnalysisRecord(mongoengine.Document):
    """
    MongoEngine Document containing the results of a text analysis.
    Stores the source text and scores (AI + Misinformation) for history pages.
    """
    user_id = mongoengine.StringField(required=True)
    input_text = mongoengine.StringField(required=True)
    ai_score = mongoengine.FloatField(required=True)
    misinformation_score = mongoengine.FloatField(required=True)
    detailed_breakdown = mongoengine.DictField(default=dict)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'analysis_records',
        'indexes': [
            {'fields': ['user_id', '-created_at']},
        ],
        'auto_create_index_on_save': False,
    }


class AnalysisJob(mongoengine.Document):
    """
    MongoEngine Document tracking asynchronous Celery analysis tasks.
    A client gets a job_id and polls status until SUCCESS.
    """
    job_id = mongoengine.StringField(required=True, unique=True)
    user_id = mongoengine.StringField(default="")
    status = mongoengine.StringField(
        choices=('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'),
        default='PENDING'
    )
    result_record_id = mongoengine.StringField(default="")
    error_message = mongoengine.StringField(default="", max_length=500)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'analysis_jobs',
        'indexes': [
            'job_id',
            {'fields': ['created_at'], 'expireAfterSeconds': 86400},
        ],
        'auto_create_index_on_save': False,
    }
