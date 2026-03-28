from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=64, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(
                    db_column='user_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='auth_token',
                    to='rings.user'
                )),
            ],
            options={
                'db_table': 'user_tokens',
                'managed': True,
            },
        ),
    ]