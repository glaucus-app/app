#!/usr/bin/env bash

set -e

# ═══════════════════════════════════════════════════════════
# CLI ARGUMENT PARSING
# ═══════════════════════════════════════════════════════════

JSON_MODE=false
SHORT_NAME=""
BRANCH_NUMBER=""
CLI_TYPE=""
CLI_TICKET=""
CLI_BRANCH_FORMAT=""
CLI_FOLDER_FORMAT=""
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json) 
            JSON_MODE=true 
            ;;
        --short-name)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            SHORT_NAME="$next_arg"
            ;;
        --number)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            BRANCH_NUMBER="$next_arg"
            ;;
        --type)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --type requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --type requires a value' >&2
                exit 1
            fi
            CLI_TYPE="$next_arg"
            ;;
        --ticket)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --ticket requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --ticket requires a value' >&2
                exit 1
            fi
            CLI_TICKET="$next_arg"
            ;;
        --branch-format)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --branch-format requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --branch-format requires a value' >&2
                exit 1
            fi
            CLI_BRANCH_FORMAT="$next_arg"
            ;;
        --folder-format)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --folder-format requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --folder-format requires a value' >&2
                exit 1
            fi
            CLI_FOLDER_FORMAT="$next_arg"
            ;;
        --help|-h) 
            echo "Usage: $0 [OPTIONS] <feature_description>"
            echo ""
            echo "Create a new feature branch and spec directory."
            echo ""
            echo "Options:"
            echo "  --json                  Output in JSON format"
            echo "  --short-name <name>     Custom short name (2-4 words) for the branch"
            echo "  --number N              Specify branch number manually"
            echo "  --type <type>           Branch type: 'feature' or 'fix' (default: auto-detect)"
            echo "  --ticket <ticket>       Ticket/identifier (e.g., 'JIRA-123')"
            echo "  --branch-format <fmt>   Override branch format template"
            echo "  --folder-format <fmt>   Override folder format template"
            echo "  --help, -h              Show this help message"
            echo ""
            echo "Template Tokens:"
            echo "  {type}    Branch type (feature/fix)"
            echo "  {ticket}  Ticket identifier (e.g., PROJ-001)"
            echo "  {seq}     Zero-padded sequence number (001, 002...)"
            echo "  {kebab}   Kebab-case feature name (user-auth)"
            echo "  {date}    Date in YYYYMMDD format"
            echo "  {branch}  Full branch name (folder_format only)"
            echo ""
            echo "Examples:"
            echo "  $0 'Add user authentication system'"
            echo "  $0 --type fix 'Fix login timeout bug'"
            echo "  $0 --ticket 'JIRA-123' 'Implement OAuth2'"
            echo "  $0 --number 5 --short-name 'user-auth' 'Add user auth'"
            exit 0
            ;;
        *) 
            ARGS+=("$arg") 
            ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [OPTIONS] <feature_description>" >&2
    exit 1
fi

# ═══════════════════════════════════════════════════════════
# SETUP AND CONFIGURATION
# ═══════════════════════════════════════════════════════════

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/naming.sh"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"

eval $(load_naming_config "$REPO_ROOT/.specify/config.yaml")

DEFAULT_BRANCH_FORMAT="{type}/{seq}-{kebab}"
DEFAULT_FOLDER_FORMAT="specs/{branch}"

if [[ -n "$CLI_BRANCH_FORMAT" ]]; then
    BRANCH_FORMAT="$CLI_BRANCH_FORMAT"
elif [[ -n "${SPECIFY_BRANCH_FORMAT:-}" ]]; then
    BRANCH_FORMAT="$SPECIFY_BRANCH_FORMAT"
elif [[ -n "$CONFIG_BRANCH_FORMAT" ]]; then
    BRANCH_FORMAT="$CONFIG_BRANCH_FORMAT"
else
    BRANCH_FORMAT="$DEFAULT_BRANCH_FORMAT"
fi

if [[ -n "$CLI_FOLDER_FORMAT" ]]; then
    FOLDER_FORMAT="$CLI_FOLDER_FORMAT"
elif [[ -n "${SPECIFY_FOLDER_FORMAT:-}" ]]; then
    FOLDER_FORMAT="$SPECIFY_FOLDER_FORMAT"
elif [[ -n "$CONFIG_FOLDER_FORMAT" ]]; then
    FOLDER_FORMAT="$CONFIG_FOLDER_FORMAT"
else
    FOLDER_FORMAT="$DEFAULT_FOLDER_FORMAT"
fi

VALIDATE_BRANCH="${CONFIG_VALIDATE_BRANCH:-}"
AUTO_DETECT="${CONFIG_AUTO_DETECT:-true}"
DEFAULT_TYPE="${CONFIG_DEFAULT_TYPE:-feature}"
IDENTIFIER="${CONFIG_IDENTIFIER:-}"

# ═══════════════════════════════════════════════════════════
# BRANCH NUMBER DETECTION
# ═══════════════════════════════════════════════════════════

get_highest_from_specs() {
    local specs_dir="$1"
    local folder_format="$2"
    local highest=0
    
    if [ -d "$specs_dir" ]; then
        if [[ "$folder_format" == *"specs/{branch}"* ]]; then
            for type_dir in "$specs_dir"/*/; do
                if [[ -d "$type_dir" ]]; then
                    for feature_dir in "$type_dir"*/; do
                        if [[ -d "$feature_dir" ]]; then
                            local dirname=$(basename "$feature_dir")
                            if [[ "$dirname" =~ ([0-9]{3}) ]]; then
                                local number="${BASH_REMATCH[1]}"
                                number=$((10#$number))
                                if [ "$number" -gt "$highest" ]; then
                                    highest=$number
                                fi
                            fi
                        fi
                    done
                fi
            done
        else
            for dir in "$specs_dir"/*; do
                [ -d "$dir" ] || continue
                dirname=$(basename "$dir")
                number=$(echo "$dirname" | grep -oE '[0-9]{3}' | head -1 || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            done
        fi
    fi
    
    echo "$highest"
}

get_highest_from_branches() {
    local highest=0
    
    branches=$(git branch -a 2>/dev/null || echo "")
    
    if [ -n "$branches" ]; then
        while IFS= read -r branch; do
            clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
            
            if [[ "$clean_branch" =~ ([0-9]{3}) ]]; then
                number="${BASH_REMATCH[1]}"
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            fi
        done <<< "$branches"
    fi
    
    echo "$highest"
}

check_existing_branches() {
    local specs_dir="$1"
    local folder_format="$2"

    git fetch --all --prune 2>/dev/null || true

    local highest_branch=$(get_highest_from_branches)
    local highest_spec=$(get_highest_from_specs "$specs_dir" "$folder_format")

    local max_num=$highest_branch
    if [ "$highest_spec" -gt "$max_num" ]; then
        max_num=$highest_spec
    fi

    echo $((max_num + 1))
}

if [ -z "$BRANCH_NUMBER" ]; then
    if [ "$HAS_GIT" = true ]; then
        BRANCH_NUMBER=$(check_existing_branches "$SPECS_DIR" "$FOLDER_FORMAT")
    else
        HIGHEST=$(get_highest_from_specs "$SPECS_DIR" "$FOLDER_FORMAT")
        BRANCH_NUMBER=$((HIGHEST + 1))
    fi
fi

# ═══════════════════════════════════════════════════════════
# COMPUTE NAMES
# ═══════════════════════════════════════════════════════════

eval $(compute_names "$FEATURE_DESCRIPTION" "$BRANCH_NUMBER" "$BRANCH_FORMAT" "$FOLDER_FORMAT" "$VALIDATE_BRANCH" "$AUTO_DETECT" "$DEFAULT_TYPE" "$IDENTIFIER" "${CLI_TYPE:-}" "${CLI_TICKET:-}" "${SHORT_NAME:-}")

# ═══════════════════════════════════════════════════════════
# BRANCH NAME LENGTH VALIDATION
# ═══════════════════════════════════════════════════════════

MAX_BRANCH_LENGTH=244
if [ ${#BRANCH_NAME} -gt $MAX_BRANCH_LENGTH ]; then
    TRUNCATED_KEBAB=$(echo "$KEBAB" | cut -c1-100)
    if [[ "$BRANCH_FORMAT" == *"{ticket}"* ]]; then
        BRANCH_NAME="${BRANCH_TYPE}/${TICKET}-${TRUNCATED_KEBAB}"
    else
        BRANCH_NAME="${BRANCH_TYPE}/${SEQ}-${TRUNCATED_KEBAB}"
    fi
    
    >&2 echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit"
    >&2 echo "[specify] Truncated to: $BRANCH_NAME"
fi

# ═══════════════════════════════════════════════════════════
# CREATE BRANCH AND DIRECTORY
# ═══════════════════════════════════════════════════════════

if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[specify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

mkdir -p "$FEATURE_DIR"

TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
SPEC_FILE="$FEATURE_DIR/spec.md"
if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$SPEC_FILE"; else touch "$SPEC_FILE"; fi

export SPECIFY_FEATURE="$BRANCH_NAME"

# ═══════════════════════════════════════════════════════════
# OUTPUT
# ═══════════════════════════════════════════════════════════

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","FEATURE_DIR":"%s","SPEC_FILE":"%s","BRANCH_TYPE":"%s","SEQ":"%s"}\n' \
        "$BRANCH_NAME" "$FEATURE_DIR" "$SPEC_FILE" "$BRANCH_TYPE" "$SEQ"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "BRANCH_TYPE: $BRANCH_TYPE"
    echo "SEQ: $SEQ"
    echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
fi
