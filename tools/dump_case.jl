# Dump the graph create_case actually builds, so the Python study mode solves
# the identical network instead of re-deriving it (and guessing which of a pair
# of parallel branches PGLibtograph's Dict iteration happened to keep).
#
# Limits are dumped UNSCALED so the app's TLF field is the only place the
# thermal-limit factor is applied: pass `case118:1.0` to defeat create_case's
# built-in 1.5x, then type 1.5 in the TLF field to get its usual limits.
#
# gridview is its own repo, so the TNROpt project is wherever you run this from:
# use --project and run it from a TNROpt checkout. Output lands in gridview's
# cases/, next to this tools/ directory.
#
#   cd /path/to/tnr
#   julia --project=. /path/to/gridview/tools/dump_case.jl case57_ieee case118:1.0 ...
#
# then, so the picture gets baseKV, transformers and the gen/load split:
#
#   python3 /path/to/gridview/tools/enrich_dump.py
try
    using TNROpt, JSON3
catch e
    error("TNROpt is not in the active project. Run with --project from a TNROpt " *
          "checkout, e.g. `cd /path/to/tnr && julia --project=. $(@__FILE__) case14`.")
end

outdir = joinpath(dirname(@__DIR__), "cases")
mkpath(outdir)

for arg in ARGS
    parts = split(arg, ':')
    case = String(parts[1])
    rc = length(parts) > 1 ? create_case(case, parse(Float64, parts[2])) : create_case(case)
    g, slack = rc.gc.g, rc.gc.bus_orig
    d = Dict(
        "case"  => case,
        "slack" => slack,
        "p"     => Dict(String(b) => g[b] for b in labels(g)),
        "edges" => [Dict("f" => br[1], "t" => br[2],
                         "b" => g[br...].b, "p_max" => g[br...].p_max)
                    for br in edge_labels(g)],
    )
    open(joinpath(outdir, case * ".json"), "w") do io
        JSON3.write(io, d)
    end
    println("$arg: $(length(collect(labels(g)))) buses, ",
            "$(length(collect(edge_labels(g)))) edges, slack $slack")
end
