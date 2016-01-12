until ./run.sh; do
    echo "Server 'node' crashed with exit code $?.  Respawning.." >&2
    sleep 1
done