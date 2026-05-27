#!/usr/bin/env bash
export LC_ALL=C
# Common functions and variables for all scripts
# This module provides path resolution and branch detection for spec-kit

# ═══════════════════════════════════════════════════════════
# NAMING MODULE INTEGRATION
# ═══════════════════════════════════════════════════════════

# Source naming module if available
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/naming.sh" ]]; then
    source "$SCRIPT_DIR/naming.sh"
fi

# ═══════════════════════════════════════════════════════════
# REPOSITORY DETECTION
# ═══════════════════════════════════════════════════════════

get_repo_root() {
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        local script_dir="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        (cd "$script_dir/../../.." && pwd)
    fi
}

has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

# ═══════════════════════════════════════════════════════════
# CONFIGURATION LOADING
# ═══════════════════════════════════════════════════════════

get_folder_format() {
    local repo_root="$1"
    local config_file="$repo_root/.specify/config.yaml"
    
    if [[ -f "$config_file" ]]; then
        local format=$(grep -E '^\s*folder_format:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*folder_format:\s*//' | tr -d '"' | tr -d "'")
        if [[ -n "$format" ]]; then
            echo "$format"
            return
        fi
    fi
    
    echo "specs/{branch}"
}

# ═══════════════════════════════════════════════════════════
# BRANCH DETECTION
# ═══════════════════════════════════════════════════════════

get_current_branch() {
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
        git rev-parse --abbrev-ref HEAD
        return
    fi

    local repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"
    local folder_format=$(get_folder_format "$repo_root")

    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0

        if [[ "$folder_format" == *"specs/{branch}"* ]]; then
            for type_dir in "$specs_dir"/*/; do
                if [[ -d "$type_dir" ]]; then
                    for feature_dir in "$type_dir"*/; do
                        if [[ -d "$feature_dir" ]]; then
                            local dirname=$(basename "$feature_dir")
                            if [[ "$dirname" =~ ([0-9]{3}) ]]; then
                                local number="${BASH_REMATCH[1]}"
                                number=$((10#$number))
                                if [[ "$number" -gt "$highest" ]]; then
                                    highest=$number
                                    local type=$(basename "$type_dir")
                                    latest_feature="$type/$dirname"
                                fi
                            fi
                        fi
                    done
                fi
            done
        else
            for dir in "$specs_dir"/*; do
                if [[ -d "$dir" ]]; then
                    local dirname=$(basename "$dir")
                    if [[ "$dirname" =~ ^([0-9]{3})- ]]; then
                        local number=${BASH_REMATCH[1]}
                        number=$((10#$number))
                        if [[ "$number" -gt "$highest" ]]; then
                            highest=$number
                            latest_feature=$dirname
                        fi
                    fi
                fi
            done
        fi

        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return
        fi
    fi

    echo "main"
}

# ═══════════════════════════════════════════════════════════
# BRANCH VALIDATION
# ═══════════════════════════════════════════════════════════

check_feature_branch() {
    local branch="$1"
    local has_git_repo="$2"

    if [[ "$has_git_repo" != "true" ]]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    if [[ ! "$branch" =~ [0-9]{3} ]]; then
        echo "ERROR: Not on a feature branch. Current branch: $branch" >&2
        echo "Feature branches should contain a sequence number (e.g., 001, 042)" >&2
        return 1
    fi

    return 0
}

# ═══════════════════════════════════════════════════════════
# FEATURE DIRECTORY RESOLUTION
# ═══════════════════════════════════════════════════════════

get_feature_dir() { 
    echo "$1/specs/$2"
}

find_feature_dir_by_prefix() {
    local repo_root="$1"
    local branch_name="$2"
    local specs_dir="$repo_root/specs"
    local folder_format=$(get_folder_format "$repo_root")

    if [[ "$folder_format" == *"specs/{branch}"* ]]; then
        if [[ -d "$specs_dir/$branch_name" ]]; then
            echo "$specs_dir/$branch_name"
            return 0
        fi
    fi

    if [[ "$branch_name" =~ ([0-9]{3}) ]]; then
        local seq="${BASH_REMATCH[1]}"
        
        if [[ "$folder_format" == *"specs/{branch}"* ]]; then
            for type_dir in "$specs_dir"/*/; do
                if [[ -d "$type_dir" ]]; then
                    for feature_dir in "$type_dir"*"$seq"*; do
                        if [[ -d "$feature_dir" ]]; then
                            echo "$feature_dir"
                            return 0
                        fi
                    done
                fi
            done
        else
            for dir in "$specs_dir"/"$seq"-*; do
                if [[ -d "$dir" ]]; then
                    echo "$dir"
                    return 0
                fi
            done
        fi
    fi

    echo "$specs_dir/$branch_name"
}

expand_folder_from_branch() {
    local folder_format="$1"
    local branch="$2"
    
    local result="$folder_format"
    result="${result//\{branch\}/$branch}"
    
    local type=""
    local seq=""
    local kebab=""
    local ticket=""
    
    if [[ "$branch" =~ ^(feature|fix)/(.+)$ ]]; then
        type="${BASH_REMATCH[1]}"
        local suffix="${BASH_REMATCH[2]}"
        
        if [[ "$suffix" =~ ([0-9]{3}) ]]; then
            seq="${BASH_REMATCH[1]}"
        fi
        
        if [[ "$suffix" =~ [0-9]{3}-(.+)$ ]]; then
            kebab="${BASH_REMATCH[1]}"
        fi
        
        if [[ "$suffix" =~ ^([A-Za-z]+)-[0-9]{3} ]]; then
            ticket="${BASH_REMATCH[1]}"
        fi
    elif [[ "$branch" =~ ^([0-9]{3})-(.+)$ ]]; then
        seq="${BASH_REMATCH[1]}"
        kebab="${BASH_REMATCH[2]}"
    fi
    
    result="${result//\{type\}/$type}"
    result="${result//\{ticket\}/$ticket}"
    result="${result//\{seq\}/$seq}"
    result="${result//\{kebab\}/$kebab}"
    
    echo "$result"
}

# ═══════════════════════════════════════════════════════════
# MAIN PATH RESOLUTION
# ═══════════════════════════════════════════════════════════

get_feature_paths() {
    local repo_root=$(get_repo_root)
    local current_branch=$(get_current_branch)
    local has_git_repo="false"

    if has_git; then
        has_git_repo="true"
    fi

    local feature_dir=$(find_feature_dir_by_prefix "$repo_root" "$current_branch")

    cat <<EOF
REPO_ROOT='$repo_root'
CURRENT_BRANCH='$current_branch'
HAS_GIT='$has_git_repo'
FEATURE_DIR='$feature_dir'
FEATURE_SPEC='$feature_dir/spec.md'
IMPL_PLAN='$feature_dir/plan.md'
TASKS='$feature_dir/tasks.md'
RESEARCH='$feature_dir/research.md'
DATA_MODEL='$feature_dir/data-model.md'
QUICKSTART='$feature_dir/quickstart.md'
CONTRACTS_DIR='$feature_dir/contracts'
EOF
}

# ═══════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════

check_file() { [[ -f "$1" ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
check_dir() { [[ -d "$1" && -n $(ls -A "$1" 2>/dev/null) ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
